package GourmetCommunity.repository;

import GourmetCommunity.entity.PostView;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostViewRepository
        extends JpaRepository<PostView, Long> {

    boolean existsByUser_IdAndPost_Id(
            Long userId,
            Long postId
    );

    /*
     * 일반 exists 쿼리가 아니라 현재 DB 상태를 읽는
     * 잠금 조회를 사용한다.
     *
     * 같은 사용자의 중복 상세 요청이 순차 처리될 때
     * 앞선 트랜잭션에서 생성한 조회 기록을 확실히 확인한다.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT postView
            FROM PostView postView
            WHERE postView.user.id = :userId
              AND postView.post.id = :postId
            """)
    Optional<PostView>
    findByUserIdAndPostIdForUpdate(
            @Param("userId")
            Long userId,

            @Param("postId")
            Long postId
    );

    void deleteByPost_Id(
            Long postId
    );

    void deleteByUser_Id(
            Long userId
    );
}