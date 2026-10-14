import type { Metadata } from "next";
import Header from "../Components/Header";
import OrdersView from "../Components/OrdersView";

export const metadata: Metadata = {
  title: "My Orders | CityMall",
};

export default function OrdersPage() {
  return (
    <>
      <Header compact />
      <OrdersView />
    </>
  );
}