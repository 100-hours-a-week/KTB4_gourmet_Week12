package GourmetCommunity.repository;

import GourmetCommunity.entity.Comment;
import GourmetCommunity.repository.projection.PostCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPost_IdOrderByIdAsc(Long postId);

    long countByPost_Id(Long postId);

    @Query("""
            SELECT
                comment.post.id AS postId,
                COUNT(comment.id) AS totalCount
            FROM Comment comment
            WHERE comment.post.id IN :postIds
            GROUP BY comment.post.id
            """)
    List<PostCountProjection> countByPostIds(
            @Param("postIds") List<Long> postIds
    );

    void deleteByPost_Id(Long postId);

    void deleteByUser_Id(Long userId);
}