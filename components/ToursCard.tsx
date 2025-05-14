import React from "react";
import { Tours } from "./ToursList";
import Link from "next/link";

const ToursCard = ({ tour }: { tour: Tours }) => {
  const { city, id, country } = tour;
  return (
    <Link
      href={`/tours/${id}`}
      className="card card-compact p-2 shadow-xl rounded-xl bg-base-100"
    >
      <div className="card-body items-center  text-center">
        <h2 className="card-title text-center">
          {city},{country}
        </h2>
      </div>
    </Link>
  );
};

export default ToursCard;
