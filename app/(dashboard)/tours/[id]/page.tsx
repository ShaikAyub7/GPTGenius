import TourInfo from "@/components/TourInfo";
import { generateTourImages, getSingleTour } from "@/utils/actions";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export default async function SingleTour({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const tour = await getSingleTour(id);

  if (!tour) {
    return redirect("/tours");
  }

  const tourImage = await generateTourImages({
    city: tour.city,
    country: tour.country,
  });
  return (
    <div>
      <Link href={"/tours"} className="btn btn-secondary mb-12">
        Back to tours
      </Link>
      {tourImage ? (
        <div>
          <img
            src={tourImage}
            alt="Panoramic view"
            className="rounded-xl shadow-xl mb-16 h-96 w-96 object-cover"
          />
        </div>
      ) : null}
      <TourInfo tour={{ ...tour, stops: tour.stops as string[] }} />
    </div>
  );
}
