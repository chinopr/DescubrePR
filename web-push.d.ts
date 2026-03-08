declare module 'web-push' {
  type PushSubscription = {
    endpoint: string;
    expirationTime?: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };

  type WebPushError = Error & {
    statusCode?: number;
    body?: string;
  };

  const webpush: {
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    generateVAPIDKeys(): { publicKey: string; privateKey: string };
    sendNotification(subscription: PushSubscription, payload?: string): Promise<void>;
    WebPushError: WebPushError;
  };

  export default webpush;
}
