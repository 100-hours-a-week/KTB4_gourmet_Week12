package GourmetCommunity.repository.projection;

public interface ChatRoomUnreadCountProjection {

    Long getRoomId();

    Long getUnreadCount();
}