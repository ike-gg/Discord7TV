import { TConsole } from "./t-console";

class ApiConsole extends TConsole {
  get prefix(): string {
    return "API";
  }
}

class CoreConsole extends TConsole {
  get prefix(): string {
    return "CORE";
  }
}

class BotConsole extends TConsole {
  get prefix(): string {
    return "BOT";
  }
}

export { ApiConsole, CoreConsole, BotConsole };
