package GourmetCommunity.repository.projection;

public interface PopularPostRankingProjection {

    Long getPostId();

    long getLikeCount();

    long getCommentCount();
}