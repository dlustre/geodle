import ZipData from '../../OC_Zip_Dataset.json';

// check each zip code in the city and return the min and max lat and long from the zip codes
export default function getMinMaxCoords(city: string): { maxLat: number, minLat: number, maxLong: number, minLong: number } | null {
    // console.log(`getMinMaxCoords ${city}`);
    const cityData = ZipData.data.filter((cityData) => cityData.City === city.toUpperCase());
    if (!cityData) return null;
    // console.log(cityData);
    // console.log(cityData[0]!.Latitude);
    // console.log(cityData[0]!.Longitude);
    const maxLat = Math.max(...cityData.map((cityData) => Number(cityData.Latitude)));
    const minLat = Math.min(...cityData.map((cityData) => Number(cityData.Latitude)));
    const maxLong = Math.max(...cityData.map((cityData) => Number(cityData.Longitude)));
    const minLong = Math.min(...cityData.map((cityData) => Number(cityData.Longitude)));
    // console.log(`maxLat: ${maxLat}, minLat: ${minLat}, maxLong: ${maxLong}, minLong: ${minLong}`);
    return { maxLat, minLat, maxLong, minLong };
}