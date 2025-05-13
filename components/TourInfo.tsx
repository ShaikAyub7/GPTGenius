import React from "react";

export type Tour = {
  city: string;
  country: string;
  title: string;
  description: string;
  stops: string[];
};

const TourInfo = ({ tour }: { tour: Tour }) => {
  const { title, description, stops } = tour;

  return (
    <div className="max-w-2xl">
      <h2 className="text-4xl font-semibold mb-4">{title}</h2>
      <p className="leading-loose mb-6">{description}</p>

      <ul>
        {stops.map((stop) => {
          return (
            <li key={stop} className="mb-4 bg-base-100 p-4 rounded-xl">
              <p>{stop}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TourInfo;
