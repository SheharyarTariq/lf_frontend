import React from "react";
import GenericTable, { Column } from "@/components/common/GenericTable";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";

interface AreaData {
  "@id": string;
  id: string;
  name: string;
  code?: string;
  city?: string;
  status?: string;
  totalPostcodes?: number;
  totalActivePostcodes?: number;
}

const columns: Column<AreaData>[] = [
  { header: "Name", accessor: "name" },
  {
    header: "Total Postcodes",
    accessor: (row) => (
      <span className="bg-muted text-black font-[400] px-[10px] py-[3px] rounded-[5px] text-[18px]">
        {row.totalPostcodes ?? 0}
      </span>
    ),
    className: "text-center",
  },
  {
    header: "Total Active Postcodes",
    accessor: (row) => (
      <span className="bg-muted text-black font-[400] px-[10px] py-[3px] rounded-[5px] text-[18px]">
        {row.totalActivePostcodes ?? 0}
      </span>
    ),
    className: "text-center",
  },
  {
    header: "Action",
    accessor: () => (
      <div className="flex justify-end">
        <img src="/assets/ArrowRight.svg" alt="" className="cursor-pointer" />
      </div>
    ),
    className: "text-right pr-[25px]",
  },
];

function AreaTable({
  areaResponse,
  isLoading,
}: {
  areaResponse: AreaData[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  return (
    <>
      <div className="mt-[30px]">
        <GenericTable
          columns={columns}
          data={areaResponse}
          isLoading={isLoading}
          onRowClick={(row) => {
            const areaId = row["@id"]?.split("/").pop() || row.id;
            router.push(
              `${routes.ui.areaDetails(areaId)}?name=${encodeURIComponent(row.name)}`
            );
          }}
        />
      </div>
    </>
  );
}

export default AreaTable;
