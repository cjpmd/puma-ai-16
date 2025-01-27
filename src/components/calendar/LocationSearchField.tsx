import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "./FestivalFormFields";
import { MapPin } from "lucide-react";
import { LocationMap } from "./LocationMap";
import { useState } from "react";

interface LocationSearchFieldProps {
  form: UseFormReturn<FormData>;
}

export const LocationSearchField = ({ form }: LocationSearchFieldProps) => {
  const [locationSearch, setLocationSearch] = useState("");
  const [showMap, setShowMap] = useState(false);

  const handleLocationSearch = async () => {
    if (!locationSearch) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationSearch)}.json?access_token=${process.env.MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features[0]) {
        form.setValue('location', data.features[0].place_name);
        setShowMap(true);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Location</FormLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <FormControl>
                <Input
                  {...field}
                  placeholder="Search for a location"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="flex-1"
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={handleLocationSearch}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {showMap && field.value && (
              <LocationMap location={field.value} />
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};