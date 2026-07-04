import {
    MdWifi,
    MdKitchen,
    MdLocalParking,
    MdAcUnit,
    MdDeviceThermostat,
    MdLocalLaundryService,
    MdWorkOutline,
    MdOutlineTv,
    MdPool,
    MdHotTub,
    MdOutlineFireplace,
    MdPets,
    MdOutlineBeachAccess,
    MdOutlineTerrain,
    MdFitnessCenter,
    MdCheckCircleOutline,
} from "react-icons/md";

export const AMENITY_ICONS = {
    WiFi: MdWifi,
    Kitchen: MdKitchen,
    "Free parking": MdLocalParking,
    "Air conditioning": MdAcUnit,
    Heating: MdDeviceThermostat,
    Washer: MdLocalLaundryService,
    Dryer: MdLocalLaundryService,
    "Dedicated workspace": MdWorkOutline,
    TV: MdOutlineTv,
    Pool: MdPool,
    "Hot tub": MdHotTub,
    Fireplace: MdOutlineFireplace,
    "Pet friendly": MdPets,
    "Beach access": MdOutlineBeachAccess,
    "Mountain view": MdOutlineTerrain,
    "Gym access": MdFitnessCenter,
};

export function getAmenityIcon(amenity) {
    return AMENITY_ICONS[amenity] || MdCheckCircleOutline;
}
