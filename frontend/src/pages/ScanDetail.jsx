import { useParams } from "react-router-dom";

export default function ScanDetails() {

  const { id } = useParams();

  return (
    <div className="text-white p-10">
      Detailed routine for scan {id}
    </div>
  );
}