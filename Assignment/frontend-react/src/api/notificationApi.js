async function requestNotificationApi(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "알림 요청을 처리하지 못했습니다.";

    try {
      const errorBody = await response.json();
      message =
        errorBody.message ||
        errorBody.error ||
        message;
    } catch {
      // 응답 본문이 없는 경우 기본 메시지를 사용한다.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getNotifications({
  page = 0,
  size = 10,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return requestNotificationApi(
    `/api/notifications?${params.toString()}`,
  );
}

export function getUnreadNotificationCount() {
  return requestNotificationApi(
    "/api/notifications/unread-count",
  );
}

export function markNotificationAsRead(
  notificationId,
) {
  return requestNotificationApi(
    `/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    },
  );
}

export function markAllNotificationsAsRead() {
  return requestNotificationApi(
    "/api/notifications/read-all",
    {
      method: "PATCH",
    },
  );
}