import { COUNTRIES_API } from "@/constants";
import axios from "axios";

export const getCountries = async (): Promise<
  { flag: string; languages: string[] }[]
> => {
  try {
    const response = await axios.get(COUNTRIES_API);

    // Debugging log to check the raw response data
    //   console.log('Raw API Response:', response.data);

    const countries = response.data
      .map(
        (country: {
          flags: { png: string };
          languages: { [s: string]: unknown } | ArrayLike<unknown>;
        }) => {
          const flag = country.flags?.png || ''; // Fallback to empty string if no flag is available
          const languages = country.languages
            ? Object.values(country.languages)
            : []; // Fallback to empty array if no languages are available

          // Debugging log for each processed country
          // console.log('Processed Country:', { flag, languages });

          return { flag, languages };
        },
      )
      .filter(
        (country: { flag: any; languages: string | any[] }) =>
          country.flag && country.languages.length > 0,
      ); // Filter out countries without flags or languages

    // Debugging log for the final filtered data
    //   console.log('Filtered Countries:', countries);

    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};


export function generateMeetingLink(): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let link = "";
  for (let i = 0; i < 6; i++) {
    link += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return link;
}