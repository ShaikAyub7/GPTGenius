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
      className=" sticky bottom-3.5 transform  max-w-4xl w-full"
    >
      <div className="join w-full">
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
