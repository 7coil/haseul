interface HaSeulLocals {
  [key: string]: any;
  [key: number]: any;
}

interface HaSeulRequest {
  err?: unknown;
  originalContent: string;
  originalUrl: string;
  params?: object;
  locals: HaSeulLocals;
}

interface HaSeulSearchResults {
  prefix: string;
  route: string | null;
  content: string;
}

type HaSeulCallbackFunction<Message> = ({
  message,
  userInput,
  route,
  err,
  content,
  prefix,
  done,
  next,
  req,
}: {
  userInput: string;
  route: string | null;
  message?: Message;
  err: unknown | undefined;
  content: string;
  prefix: string;
  done: (err?: Error) => void;
  next: (err?: Error) => void;
  req: HaSeulRequest;
}) => void;

interface HaSeulDiscordCommand {
  name: string;
  description: string;
}

export {
  HaSeulRequest,
  HaSeulSearchResults,
  HaSeulCallbackFunction,
  HaSeulDiscordCommand,
};
