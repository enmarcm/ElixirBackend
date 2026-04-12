import picocolors from "picocolors";
import { StartServerProps } from "./types";

export function startServer({ app, PORT }: StartServerProps) {
  app.listen(PORT, () => {
    console.log(
      picocolors.bgBlack(picocolors.green(`SERVER RUNNING ON PORT ${PORT}`))
    );
  });
}
