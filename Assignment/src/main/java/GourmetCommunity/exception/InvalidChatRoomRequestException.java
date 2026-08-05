package GourmetCommunity.exception;

public class InvalidChatRoomRequestException
        extends RuntimeException {

    public InvalidChatRoomRequestException(
            String message
    ) {
        super(message);
    }
}