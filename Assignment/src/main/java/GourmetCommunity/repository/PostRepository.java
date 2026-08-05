package GourmetCommunity.repository;

import GourmetCommunity.entity.BoardType;
import GourmetCommunity.entity.Post;
import GourmetCommunity.repository.projection.PopularPostRankingProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository
        extends JpaRepository<Post, Long>,
        PostSearchRepository {

    List<Post> findByUser_IdOrderByIdAsc(Long userId);

    @Override
    @EntityGraph(attributePaths = "user")
    Page<Post> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<Post> findByBoardType(
            BoardType boardType,
            Pageable pageable
    );

    /*
     * 순위 조회 쿼리는 필요한 게시글 ID와 집계값만 가져온다.
     *
     * 정렬 기준:
     * 1. 좋아요 수
     * 2. 댓글 수
     * 3. 조회수
     * 4. 작성 시각
     * 5. 게시글 ID
     */
    @Query(
            value = """
                    SELECT
                        p.post_id AS postId,
                        COUNT(
                            DISTINCT pl.post_like_id
                        ) AS likeCount,
                        COUNT(
                            DISTINCT c.comment_id
                        ) AS commentCount
                    FROM posts p
                    LEFT JOIN post_likes pl
                        ON pl.post_id = p.post_id
                    LEFT JOIN comments c
                        ON c.post_id = p.post_id
                        AND c.deleted_at IS NULL
                    WHERE p.created_at >= :since
                      AND p.deleted_at IS NULL
                    GROUP BY
                        p.post_id,
                        p.view_count,
                        p.created_at
                    HAVING
                        COUNT(
                            DISTINCT pl.post_like_id
                        ) > 0
                        OR
                        COUNT(
                            DISTINCT c.comment_id
                        ) > 0
                    ORDER BY
                        COUNT(
                            DISTINCT pl.post_like_id
                        ) DESC,
                        COUNT(
                            DISTINCT c.comment_id
                        ) DESC,
                        p.view_count DESC,
                        p.created_at DESC,
                        p.post_id DESC
                    """,
            nativeQuery = true
    )
    List<PopularPostRankingProjection>
    findPopularPostRankings(
            @Param("since")
            LocalDateTime since,

            Pageable pageable
    );

    /*
     * 순위 쿼리에서 얻은 게시글 ID를 이용해
     * 작성자까지 한 번에 조회한다.
     *
     * 반환 순서는 보장되지 않으므로
     * Service에서 순위 순서로 다시 정렬한다.
     */
    @EntityGraph(attributePaths = "user")
    List<Post> findAllByIdIn(List<Long> postIds);

    @Modifying(flushAutomatically = true)
    @Query("""
        UPDATE Post post
        SET post.viewCount = post.viewCount + 1
        WHERE post.id = :postId
        """)
    int incrementViewCount(
            @Param("postId") Long postId
    );

}