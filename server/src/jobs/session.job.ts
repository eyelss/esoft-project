import cron from "node-cron";
import { destroyExpiredSessions } from "../services/session.service";

// s m h d(om) m d(ow)
cron.schedule('0 0 * * *', async () => {
  try {
    const payload = await destroyExpiredSessions();

  } catch (err) {
    console.error(err);
  }
});