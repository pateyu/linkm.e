import Head from "next/head";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Linkm.e Page</title>
      </Head>
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        <h1 className="text-4xl">linkm.e</h1>
      </div>
    </>
  );
};

export default HomePage;
