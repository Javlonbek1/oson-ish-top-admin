import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import {
  FaPhone,
  FaUser,
  FaMoneyBill,
  FaClock,
  FaTelegram,
  FaTransgender,
  FaUserGraduate,
  FaRegEye,
  FaRegBookmark,
  FaMapMarkedAlt,
  FaHashtag,
  FaUserTie,
  FaMoneyCheck,
  FaGlobe,
} from "react-icons/fa";

import {
  MdClose,
  MdWork,
  MdBusiness,
  MdOutlineWorkHistory,
  MdOutlineVerified,
  MdWorkHistory,
} from "react-icons/md";
import { IoLocationSharp } from "react-icons/io5";
import axiosInstance from "./../../api/axiosInstance";
import GoogleMapView from "./components/AnnDetailMap";
import VacancyDates from "./components/VacancyDate";
import ImageGallery from "./components/SwiperImages";
import { MdOutlineDescription } from "react-icons/md";
import { GiPathDistance } from "react-icons/gi";


import { GrUserWorker } from "react-icons/gr";

const InfoItem = ({ icon: Icon, value, color }) => (
  <div className="flex text-indigo-500 items-center gap-2 bg-gray-50 rounded-lg p-2">
    <Icon className={`text-${color || "indigo"}-500`} />
    <span className="text-gray-700 lowercase">{value}</span>
  </div>
);

const AnnFilterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const queryClient = useQueryClient();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");

  const annId = id.split("|")[1];

  console.log(id.split("|")[1]);

  // Vacancy detail
  const {
    data: vacancy,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vacancyDetail", id.split("|")[1]],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/vacancy/by-ann/${id.split("|")[1]}`
      );
      return res.data?.data;
    },
    enabled: !!id.split("|")[1],
  });

  // Vacancy images
  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ["vacancyImages", id.split("|")[1]],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/vacancy/ann-resources/by-ann/${id.split("|")[1]}`
      );
      return res.data?.data || [];
    },
    enabled: !!id.split("|")[1],
  });

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: async () => axiosInstance.post(`/ann/accept/${annId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["vacancyDetail", annId]);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () =>
      axiosInstance.post(`/ann/reject/${annId}?reason=${reason}`),
    onSuccess: () => {
      setShowRejectModal(false);
      setReason("");
      queryClient.invalidateQueries(["vacancyDetail", annId]);
    },
  });

  if (isLoading || imagesLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (isError || !vacancy) {
    return (
      <div className="text-center p-10 text-red-500">
        Error loading vacancy detail!
      </div>
    );
  }

  return (
    <>
      <div className="w-full mx-auto p-0   space-y-4">
        {/* REJECT MODAL */}
        {showRejectModal && (
          <div
            className="fixed px-[20px] inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowRejectModal(false)} // tashqarisini bossang yopiladi
          >
            <div
              className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg"
              onClick={(e) => e.stopPropagation()} // ichki qismini bosganda yopilmaydi
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowRejectModal(false)}
              >
                <MdClose size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Reject qilish sababi
              </h2>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Sababni kiriting..."
                className="w-full border rounded-lg p-2 mb-4"
              />
              <button
                onClick={() => rejectMutation.mutate()}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative">
          <ImageGallery images={images} />

          {/* MAP */}
          <div className="relativez z-0 sm:z-10">
            <GoogleMapView ann={vacancy} />
          </div>

          {/* STATS */}
          <div className="bg-white shadow-sm rounded-xl p-4  relative z-0  sm:z-10">
            <div
              className=" flex items-center gap-[10px
            ] justify-between font-semibold text-gray-700 text-lg border-b pb-2"
            >
              <h2>Status</h2>
              <InfoItem icon={FaHashtag} value={vacancy.code} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <InfoItem
                icon={MdOutlineVerified}
                value={vacancy.annTypeName}
                color="green"
              />
              <InfoItem
                icon={FaMoneyCheck}
                value={`${vacancy.price} so'm`}
                color="green"
              />
              <InfoItem
                icon={FaRegEye}
                value={vacancy.viewCnt || vacancy.viewCount}
              />
              <InfoItem icon={FaRegBookmark} value={vacancy.savedCount ?? 0} />
            </div>
            {/* HEADER STATUS */}
            <div className="bg-gradient-to-r mt-2 from-indigo-50 to-white shadow-md border border-indigo-100 p-3 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-xl font-semibold shadow text-sm ${
                    vacancy.annStatus === "WAITING"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : vacancy.annStatus === "ACCEPTED"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  {vacancy.annStatus}
                </span>
              </div>

              {/* Buttons */}
              {vacancy.annStatus === "WAITING" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => acceptMutation.mutate()}
                    className="flex cursor-pointer items-center gap-2 px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 shadow hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex cursor-pointer items-center gap-2 px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 shadow hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
            {/* DATES */}
            <div className="relative z-10">
              <VacancyDates vacancy={vacancy} />
            </div>
          </div>
        </div>

        <div className="grid bg-white shadow-sm rounded-xl md:grid-cols-3 gap-[30px]">
          {/* Umumiy */}
          <div className=" p-4 sm:p-6 flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700 text-lg border-b pb-2">
              Umumiy
            </h2>
            <div className="grid grid-cols-1 gap-[5px]">
              <InfoItem icon={MdBusiness} value={vacancy.company} />
              <InfoItem icon={IoLocationSharp} value={vacancy.address} />
              <InfoItem icon={GiPathDistance} value={vacancy.distance} />
              <InfoItem
                icon={FaMoneyBill}
                value={`${vacancy.salaryFrom} - ${vacancy.salaryTo} ${vacancy.annSalaryCurrency}`}
                color="green"
              />
            </div>
          </div>
          {/* JOB INFO */}
          <div className=" p-4 sm:p-6">
            <h2 className="font-semibold text-gray-700 text-lg border-b pb-2">
              Ish haqida
            </h2>
            <div className="grid grid-cols-2 gap-1 pt-4">
              <InfoItem icon={MdWork} value={vacancy.annJobTypesName} />
              <InfoItem
                icon={MdOutlineWorkHistory}
                value={vacancy.experience}
              />
              <InfoItem icon={FaClock} value={`${vacancy.days} days`} />
              <InfoItem
                icon={FaTransgender}
                value={vacancy.gender === "ALL" ? "ALL" : vacancy.gender === "MALE" ? "Erkak" : "Ayol"}
                color="pink"
              />
              <InfoItem
                icon={FaUserGraduate}
                value={vacancy.studentIsNeeded ? "Student" : "No"}
              />
              <InfoItem
                icon={FaGlobe}
                value={vacancy.isRemote ? "Remote" : "Office"}
              />
              <InfoItem
                icon={FaUserTie}
                value={`${vacancy.peopleCnt} people`}
              />
              <InfoItem
                icon={FaClock}
                value={
                  vacancy.isThereTrialPeriod
                    ? `${vacancy.trialPeriod} ${vacancy.annTrialPeriodTypes}`
                    : "No trial"
                }
              />
            </div>
          </div>
          {/* CONTACT */}
          <div className=" p-4 sm:p-6 flex flex-col gap-1">
            <h2 className="font-semibold text-gray-700 text-lg border-b pb-2">
              Contact
            </h2>
            <div className="grid mt-[5px] pt-2 grid-cols-1 gap-[5px]">
              <button
                className="cursor-pointer"
                onClick={() => navigate(`/users/${id.split("|")[0]}`)}
              >
                <InfoItem icon={FaUser} value={vacancy.ownerFio} />
              </button>
              <a href={`tel:${id?.split("|")[2].split(".")[0]}`}>
                <InfoItem
                  icon={FaPhone}
                  value={id?.split("|")[2].split(".")[0]}
                  color="green"
                />
              </a>
              <div className="grid grid-cols-2 gap-[5px]">
                {vacancy.contacts.split(",").map((el) => (
                  <a href={`tel:${el}`}>
                    <InfoItem icon={MdWorkHistory} value={el} color="green" />
                  </a>
                ))}
              </div>

              <a
                href={`https://t.me/${
                  vacancy.telegramUsername
                    ?.replace("https://t.me/", "") // link bo‘lsa, boshini olib tashlaydi
                    ?.replace("@", "") // @ bo‘lsa, olib tashlaydi
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InfoItem
                  icon={FaTelegram}
                  value={vacancy.telegramUsername}
                  color="sky"
                />
              </a>
            </div>
          </div>
        </div>
        {/* DESCRIPTION*/}
        <div className=" p-4 flex flex-col bg-white shadow-sm rounded-xl gap-[10px]">
          <h2 className="font-semibold text-gray-700 text-lg border-b">
            Description
          </h2>
          <InfoItem
            icon={MdOutlineDescription}
            value={`${vacancy.description} people`}
          />
        </div>
      </div>
    </>
  );
};

export default AnnFilterDetail;
