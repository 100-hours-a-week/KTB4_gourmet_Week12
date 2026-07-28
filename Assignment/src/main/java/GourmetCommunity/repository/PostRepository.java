package GourmetCommunity.repository;

import GourmetCommunity.entity.BoardType;
import GourmetCommunity.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository
        extends JpaRepository<Post, Long>,
        PostSearchRepository{

    List<Post> findByUser_IdOrderByIdAsc(Long userId);

    @Override
    @EntityGraph(attributePaths = "user")
    Page<Post> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<Post> findByBoardType(
            BoardType boardType,
            Pageable pageable
    );
}