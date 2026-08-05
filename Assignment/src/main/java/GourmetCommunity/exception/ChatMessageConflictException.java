package GourmetCommunity.exception;

public class ChatMessageConflictException
        extends RuntimeException {

    public ChatMessageConflictException(
            String message,
            Throwable cause
    ) {
        super(
                message,
                cause
        );
    }
}