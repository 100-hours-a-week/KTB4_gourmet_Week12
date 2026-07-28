package GourmetCommunity.repository;

import GourmetCommunity.entity.Post;
import GourmetCommunity.search.PostSearchCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostSearchRepository {

    Page<Post> search(
            PostSearchCondition condition,
            Pageable pageable
    );
}

/*
LIKE
→ Full Text Search

Offset
→ Cursor 기반 조회
 */