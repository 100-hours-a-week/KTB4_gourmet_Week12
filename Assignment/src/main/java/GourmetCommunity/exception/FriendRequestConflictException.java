package GourmetCommunity.exception;

public class FriendRequestConflictException
        extends RuntimeException {

    public FriendRequestConflictException(
            String message
    ) {
        super(message);
    }

    public FriendRequestConflictException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}