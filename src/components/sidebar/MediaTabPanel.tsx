import { ImageUploader } from "../ImageUploader";

export function MediaTabPanel() {
  return (
    <div className="flex flex-col gap-4">
      <ImageUploader />
    </div>
  );
}
