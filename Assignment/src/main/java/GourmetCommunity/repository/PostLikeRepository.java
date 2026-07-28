package GourmetCommunity.repository;

import GourmetCommunity.entity.PostLike;
import GourmetCommunity.repository.projection.PostCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    boolean existsByUser_IdAndPost_Id(Long userId, Long postId);

    Optional<PostLike> findByUser_IdAndPost_Id(Long userId, Long postId);

    long countByPost_Id(Long postId);

    @Query("""
            SELECT
                postLike.post.id AS postId,
                COUNT(postLike.id) AS totalCount
            FROM PostLike postLike
            WHERE postLike.post.id IN :postIds
            GROUP BY postLike.post.id
            """)
    List<PostCountProjection> countByPostIds(
            @Param("postIds") List<Long> postIds
    );

    void deleteByPost_Id(Long postId);

    void deleteByUser_Id(Long userId);
}