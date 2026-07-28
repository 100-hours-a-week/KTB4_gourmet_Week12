package GourmetCommunity.service;

import GourmetCommunity.dto.PostPageResponseDto;
import GourmetCommunity.dto.PostResponseDto;
import GourmetCommunity.entity.BoardType;
import GourmetCommunity.entity.Post;
import GourmetCommunity.repository.PostRepository;
import GourmetCommunity.search.PostSearchCondition;
import GourmetCommunity.search.PostSortType;
import GourmetCommunity.search.SearchType;
import GourmetCommunity.service.assembler.PostResponseAssembler;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostSearchService {

    private final PostRepository postRepository;
    private final PostResponseAssembler postResponseAssembler;

    public PostPageResponseDto searchPosts(
            String keyword,
            SearchType searchType,
            BoardType boardType,
            PostSortType sortType,
            int page,
            int size
    ) {
        PostSearchCondition condition =
                new PostSearchCondition(
                        keyword,
                        searchType,
                        boardType,
                        sortType
                );

        PageRequest pageable =
                PageRequest.of(
                        page,
                        size
                );

        Page<Post> postPage =
                postRepository.search(
                        condition,
                        pageable
                );

        List<PostResponseDto> content =
                postResponseAssembler.toDtos(
                        postPage.getContent()
                );

        return new PostPageResponseDto(
                content,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.hasNext(),
                postPage.hasPrevious()
        );
    }
}