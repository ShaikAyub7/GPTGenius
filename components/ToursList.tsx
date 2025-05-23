import React from "react";
import type { JsonValue } from "@prisma/client/runtime/library";
import ToursCard from "./ToursCard";

export type Tours = {
  title: string;
  image: string | null;
  city: string;
  country: string;
  id: string;
  createdAt: Date;
  stops: JsonValue;
};

const ToursList = ({ data }: { data: Tours[] }) => {
  if (data.length === 0)
    return <h4 className="text-lg">tours not found ...</h4>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {data.map((tour) => {
        return <ToursCard key={tour.id} tour={tour} />;
      })}
    </div>
  );
};

export default ToursList;
