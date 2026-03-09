import { useRouter } from "next/navigation";

function BackArrow() {
  const router = useRouter();
  return (
    <img
      src="/assets/BackArrow.svg"
      alt="Back Arrow"
      onClick={() => router.back()}
      className="cursor-pointer  px-3 py-2 hover:bg-muted rounded-lg transition-all duration-300"
    />
  );
}

export default BackArrow;
