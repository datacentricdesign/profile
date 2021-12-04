import { Profile } from "./Profile";
import { Log } from "./Logger";

const profile = new Profile();
profile.start();

process.on("SIGTERM", () => {
  profile.stop().then(() => {
    Log.info("Profile API Grafully stopped.");
    process.exit();
  });
});

process.on("SIGINT", () => {
  profile.stop().then(() => {
    Log.info("Profile API Grafully stopped.");
    process.exit();
  });
});
