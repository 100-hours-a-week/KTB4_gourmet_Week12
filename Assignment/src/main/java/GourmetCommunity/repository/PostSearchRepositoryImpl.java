package GourmetCommunity.repository;

import GourmetCommunity.entity.Post;
import GourmetCommunity.search.PostSearchCondition;
import GourmetCommunity.search.PostSortType;
import GourmetCommunity.search.SearchType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PostSearchRepositoryImpl
        implements PostSearchRepository {

    private final EntityManager entityManager;

    @Override
    public Page<Post> search(
            PostSearchCondition condition,
            Pageable pageable
    ) {
        String whereClause =
                createWhereClause(condition);

        /*
         * 좋아요순은 post_likes 집계가 필요하므로
         * 일반 최신순·조회순 쿼리와 분리한다.
         */
        if (
                condition.getSortType()
                        == PostSortType.LIKE_COUNT
        ) {
            return searchByLikeCount(
                    condition,
                    pageable,
                    whereClause
            );
        }

        String orderByClause =
                createOrderByClause(
                        condition.getSortType()
                );

        String contentJpql = """
                SELECT post
                FROM Post post
                JOIN FETCH post.user user
                """ + whereClause + orderByClause;

        TypedQuery<Post> contentQuery =
                entityManager.createQuery(
                        contentJpql,
                        Post.class
                );

        setParameters(
                contentQuery,
                condition
        );

        contentQuery.setFirstResult(
                Math.toIntExact(
                        pageable.getOffset()
                )
        );

        contentQuery.setMaxResults(
                pageable.getPageSize()
        );

        List<Post> content =
                contentQuery.getResultList();

        long totalElements =
                countSearchResults(
                        condition,
                        whereClause
                );

        return new PageImpl<>(
                content,
                pageable,
                totalElements
        );
    }

    private Page<Post> searchByLikeCount(
            PostSearchCondition condition,
            Pageable pageable,
            String whereClause
    ) {
        /*
         * 1차 쿼리
         *
         * 검색 조건에 맞는 게시글 ID를
         * 좋아요 개수 내림차순으로 페이징한다.
         *
         * 좋아요가 없는 게시글도 결과에 포함하기 위해
         * LEFT JOIN을 사용한다.
         */
        String idJpql = """
                SELECT post.id
                FROM Post post
                JOIN post.user user
                LEFT JOIN PostLike postLike
                    ON postLike.post.id = post.id
                """ + whereClause + """
                GROUP BY
                    post.id,
                    post.createdAt
                ORDER BY
                    COUNT(postLike.id) DESC,
                    post.createdAt DESC,
                    post.id DESC
                """;

        TypedQuery<Long> idQuery =
                entityManager.createQuery(
                        idJpql,
                        Long.class
                );

        setParameters(
                idQuery,
                condition
        );

        idQuery.setFirstResult(
                Math.toIntExact(
                        pageable.getOffset()
                )
        );

        idQuery.setMaxResults(
                pageable.getPageSize()
        );

        List<Long> postIds =
                idQuery.getResultList();

        long totalElements =
                countSearchResults(
                        condition,
                        whereClause
                );

        if (postIds.isEmpty()) {
            return new PageImpl<>(
                    List.of(),
                    pageable,
                    totalElements
            );
        }

        /*
         * 2차 쿼리
         *
         * 위에서 구한 ID에 해당하는 게시글과
         * 작성자를 한 번에 조회한다.
         */
        String contentJpql = """
                SELECT post
                FROM Post post
                JOIN FETCH post.user user
                WHERE post.id IN :postIds
                """;

        TypedQuery<Post> contentQuery =
                entityManager.createQuery(
                        contentJpql,
                        Post.class
                );

        contentQuery.setParameter(
                "postIds",
                postIds
        );

        List<Post> unorderedContent =
                contentQuery.getResultList();

        /*
         * IN 쿼리는 결과 순서를 보장하지 않으므로
         * 1차 쿼리에서 얻은 좋아요순 ID 순서대로
         * 게시글을 다시 정렬한다.
         */
        Map<Long, Post> postMap =
                unorderedContent.stream()
                        .collect(
                                Collectors.toMap(
                                        Post::getId,
                                        post -> post
                                )
                        );

        List<Post> orderedContent =
                postIds.stream()
                        .map(postMap::get)
                        .filter(Objects::nonNull)
                        .toList();

        return new PageImpl<>(
                orderedContent,
                pageable,
                totalElements
        );
    }

    private long countSearchResults(
            PostSearchCondition condition,
            String whereClause
    ) {
        String countJpql = """
                SELECT COUNT(post.id)
                FROM Post post
                JOIN post.user user
                """ + whereClause;

        TypedQuery<Long> countQuery =
                entityManager.createQuery(
                        countJpql,
                        Long.class
                );

        setParameters(
                countQuery,
                condition
        );

        return countQuery.getSingleResult();
    }

    private String createWhereClause(
            PostSearchCondition condition
    ) {
        StringBuilder where =
                new StringBuilder(
                        " WHERE 1 = 1 "
                );

        if (
                condition.getBoardType()
                        != null
        ) {
            where.append(
                    " AND post.boardType = :boardType "
            );
        }

        SearchType searchType =
                condition.getSearchType();

        switch (searchType) {
            case TITLE -> where.append("""
                     AND LOWER(post.title)
                         LIKE :keyword
                    """);

            case CONTENT -> where.append("""
                     AND LOWER(post.content)
                         LIKE :keyword
                    """);

            case NICKNAME -> where.append("""
                     AND LOWER(user.nickname)
                         LIKE :keyword
                    """);

            case ALL -> where.append("""
                     AND (
                            LOWER(post.title)
                                LIKE :keyword
                         OR LOWER(post.content)
                                LIKE :keyword
                         OR LOWER(user.nickname)
                                LIKE :keyword
                     )
                    """);
        }

        return where.toString();
    }

    private String createOrderByClause(
            PostSortType sortType
    ) {
        if (
                sortType
                        == PostSortType.VIEW_COUNT
        ) {
            return """
                     ORDER BY
                         post.viewCount DESC,
                         post.createdAt DESC,
                         post.id DESC
                    """;
        }

        return """
                 ORDER BY
                     post.createdAt DESC,
                     post.id DESC
                """;
    }

    private void setParameters(
            Query query,
            PostSearchCondition condition
    ) {
        String keywordPattern =
                "%" +
                        condition.getKeyword()
                                .toLowerCase(
                                        Locale.ROOT
                                ) +
                        "%";

        query.setParameter(
                "keyword",
                keywordPattern
        );

        if (
                condition.getBoardType()
                        != null
        ) {
            query.setParameter(
                    "boardType",
                    condition.getBoardType()
            );
        }
    }
}