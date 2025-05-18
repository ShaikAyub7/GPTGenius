"use client";
import React, { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExistingTour,
  generateTourResponse,
  createNewTour,
} from "@/utils/actions";
import TourInfo from "./TourInfo";
import toast from "react-hot-toast";

type tour = {
  city: string;
  country: string;
};

const NewTour = () => {
  const queryClient = useQueryClient();
  const {
    mutate,
    isPending,
    data: tour,
  } = useMutation({
    mutationFn: async (destination: tour) => {
      const existingTour = await getExistingTour(destination);
      if (existingTour) return existingTour;

      const newTour = await generateTourResponse(destination);
      if (newTour) {
        const response = await createNewTour(newTour);
        queryClient.invalidateQueries({ queryKey: ["tours"] });
        return newTour;
      }

      toast.error("No City Found ....");
      return null;
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destination = Object.fromEntries(formData.entries()) as tour;
    mutate(destination);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-dots"></span>
      </div>
    );
  }
  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl ">
        <h2 className="mb-4">Select your dream destination</h2>
        <div className="join w-full">
          <input
            type="text"
            placeholder="city"
            className="input input-bordered join-item w-full"
            name="city"
            required
          />
          <input
            type="text"
            placeholder="country"
            className="input input-bordered join-item w-full"
            name="country"
            required
          />
          <button className="btn btn-primary join-item" type="submit">
            {" "}
            generate
          </button>
        </div>
      </form>
      <div className="mt-16">{tour ? <TourInfo tour={tour} /> : ""}</div>
    </>
  );
};

export default NewTour;
