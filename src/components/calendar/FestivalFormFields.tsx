import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required",
  }),
  location: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  format: z.enum(["4-a-side", "5-a-side", "7-a-side", "9-a-side", "11-a-side"]),
  numberOfTeams: z.coerce.number().min(2, "At least 2 teams required"),
});

type FormData = z.infer<typeof formSchema>;

interface FestivalFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export const FestivalFormFields = ({ form }: FestivalFormFieldsProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !showMap) return;

    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'; // This should be replaced with the actual token from Supabase secrets
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 13
    });

    return () => {
      map.current?.remove();
    };
  }, [showMap]);

  const handleLocationSearch = async () => {
    if (!locationSearch) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationSearch)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features[0]) {
        const [lng, lat] = data.features[0].center;
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 14
        });
        
        form.setValue('location', data.features[0].place_name);
        setShowMap(true);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date *</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="format"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Format *</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="4-a-side">4-a-side</SelectItem>
                <SelectItem value="5-a-side">5-a-side</SelectItem>
                <SelectItem value="7-a-side">7-a-side</SelectItem>
                <SelectItem value="9-a-side">9-a-side</SelectItem>
                <SelectItem value="11-a-side">11-a-side</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="numberOfTeams"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Teams *</FormLabel>
            <FormControl>
              <Input type="number" min="2" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
              {showMap && (
                <div ref={mapContainer} className="h-[200px] rounded-md border" />
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export { formSchema };
export type { FormData };