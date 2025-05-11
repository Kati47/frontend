import RoomPlanner from "./room-planner"
import { ThemeProvider } from "../../../components/contexts/theme-context"

export default function Page() {
  return (
    <ThemeProvider>
      <RoomPlanner />
    </ThemeProvider>
  )
}
