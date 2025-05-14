// app/(dashboard)/tours/[id]/page.tsx
import { generateTourImages, getSingleTour } from "@/utils/actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import TourInfo from "@/components/TourInfo";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const tour = await getSingleTour(params.id);

  if (!tour) {
    return redirect("/tours");
  }

  const tourImage = await generateTourImages({
    city: tour.city,
    country: tour.country,
  });

  return (
    <div>
      <Link href="/tours" className="btn btn-secondary mb-12">
        Back to tours
      </Link>
      {tourImage && (
        <img
          src={tourImage}
          alt="Panoramic view"
          className="rounded-xl shadow-xl mb-16 h-96 w-96 object-cover"
        />
      )}
      <TourInfo tour={{ ...tour, stops: tour.stops as string[] }} />
    </div>
  );
}
