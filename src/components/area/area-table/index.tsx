import React from "react";
import GenericTable, { Column } from "@/components/common/GenericTable";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/routes";

interface AreaData {
  "@id": string;
  id: string;
  name: string;
  code: string;
  city: string;
  status: string;
}

const columns: Column<AreaData>[] = [
  { header: "Area Name", accessor: "name" },
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
