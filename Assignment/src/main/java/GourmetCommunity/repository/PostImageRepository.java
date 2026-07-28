package GourmetCommunity.repository;

import GourmetCommunity.entity.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {

    List<PostImage> findByPost_IdAndDeletedAtIsNullOrderBySortOrderAsc(Long postId);

    @Query("""
            SELECT postImage
            FROM PostImage postImage
            WHERE postImage.post.id IN :postIds
              AND postImage.deletedAt IS NULL
            ORDER BY
                postImage.post.id ASC,
                postImage.sortOrder ASC
            """)
    List<PostImage> findAllByPostIds(
            @Param("postIds") List<Long> postIds
    );

    void deleteByPost_Id(Long postId);
}