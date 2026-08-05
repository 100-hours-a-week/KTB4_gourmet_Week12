package GourmetCommunity.exception;

public class ChatRoomConflictException
        extends RuntimeException {

    public ChatRoomConflictException(
            String message
    ) {
        super(message);
    }

    public ChatRoomConflictException(
            String message,
            Throwable cause
    ) {
        super(
                message,
                cause
        );
    }
}