"use client";

const Form = ({
  handleSubmit,
  text,
  setText,
  isPending,
}: {
  handleSubmit: (e: React.FormEvent) => void;
  text: string;
  setText: (text: string) => void;
  isPending: boolean;
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-6 lg:w-full max-w-lg lg:max-w-4xl pt-12  md:max-w-xl m-auto"
    >
      <div className="join md:full  lg:w-full">
        <input
          type="text"
          placeholder="Message GeniusGpt"
          className="input input-bordered join-item w-full"
          value={text}
          required
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="btn btn-primary p-4 rounded-br-lg rounded-tr-lg join-item "
          disabled={isPending}
          title="Ask button"
        >
          {isPending ? "please wait..." : "Ask Question"}
        </button>
      </div>
    </form>
  );
};

export default Form;
