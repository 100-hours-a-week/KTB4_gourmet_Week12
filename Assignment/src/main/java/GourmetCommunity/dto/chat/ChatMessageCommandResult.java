package GourmetCommunity.dto.chat;

public record ChatMessageCommandResult(
        ChatMessageResponseDto message,
        Long userAId,
        Long userBId,
        boolean created
) {

    public static ChatMessageCommandResult created(
            ChatMessageResponseDto message,
            Long userAId,
            Long userBId
    ) {
        return new ChatMessageCommandResult(
                message,
                userAId,
                userBId,
                true
        );
    }

    public static ChatMessageCommandResult duplicated(
            ChatMessageResponseDto message,
            Long userAId,
            Long userBId
    ) {
        return new ChatMessageCommandResult(
                message,
                userAId,
                userBId,
                false
        );
    }
}