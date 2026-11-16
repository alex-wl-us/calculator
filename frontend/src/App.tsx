import { navigate, useRoute } from "./router";
import { CalculatorPage } from "./pages/CalculatorPage";

export function App() {
  const route = useRoute();
  void route;
  void navigate;
  return <CalculatorPage />;
}
