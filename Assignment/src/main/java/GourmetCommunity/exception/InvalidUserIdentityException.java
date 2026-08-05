package GourmetCommunity.exception;

public class InvalidUserIdentityException
        extends RuntimeException {

    public InvalidUserIdentityException(
            String message
    ) {
        super(message);
    }
}