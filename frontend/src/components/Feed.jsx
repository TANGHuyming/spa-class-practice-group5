import { useEffect, useState } from "react";
import { api } from "../api";

export default function Feed() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeed = async () => {
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // const fetchFeed = async () => {
  //   try {
  //     const data = [
  //       {
  //         id: 1,
  //         name: "Alex Rivera",
  //         tel: "+1-555-010-2345",
  //         description:
  //           "Senior software architect specializing in distributed systems and cloud infrastructure.",
  //         timestamp: new Date(),
  //       },
  //       {
  //         id: 2,
  //         name: "Samantha Chen",
  //         tel: "+1-555-012-3456",
  //         description:
  //           "Freelance graphic designer and illustrator with a focus on minimalist branding.",
  //         timestamp: new Date(),
  //       },
  //       {
  //         id: 3,
  //         name: "Jordan Smith",
  //         tel: "+1-555-014-5678",
  //         description:
  //           "Project manager for the regional sustainability initiative and urban planning committee.",
  //         timestamp: new Date(),
  //       },
  //       {
  //         id: 4,
  //         name: "Dr. Elena Vance",
  //         tel: "+1-555-016-7890",
  //         description:
  //           "Lead researcher in renewable energy technologies and energy storage solutions.",
  //         timestamp: new Date(),
  //       },
  //       {
  //         id: 5,
  //         name: "Marcus Thorne",
  //         tel: "+1-555-018-9012",
  //         description:
  //           "Customer success lead responsible for high-value enterprise accounts in the APAC region.",
  //         timestamp: new Date(),
  //       },
  //     ];

  //     setContacts(data);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading feed...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  console.log(contacts);

  return (
    <div className="max-w-md mx-auto mt-6 flex flex-col gap-8 pb-20">
      {contacts.length === 0 ? (
        <p className="text-center text-gray-500">
          No contacts yet. Be the first to upload!
        </p>
      ) : (
        contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white border border-gray-300 rounded overflow-hidden shadow-sm"
          >
            {/* Header */}
            <div className="p-3 font-semibold text-sm border-b border-gray-100 bg-gray-50">
              {contact.name}
            </div>

            <div className="p-3">
              {/* Phone Number - Adding the missing field */}
              <p className="text-blue-600 text-sm font-medium mb-1">
                {contact.tel}
              </p>

              <p className="text-sm text-gray-700">{contact.description}</p>

              {/* Formatting the Date Object to a String */}
              <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-wider">
                {contact.timestamp instanceof Date
                  ? contact.timestamp.toLocaleString()
                  : contact.timestamp}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
