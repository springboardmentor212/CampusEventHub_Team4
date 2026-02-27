import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");

  const categories = ["All Categories", "Workshop", "Sports", "Cultural", "Hackathon", "Seminar", "Technical"];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, collegesRes] = await Promise.all([
        API.get("/events", {
          params: {
            category: category === "All Categories" ? "" : category.toLowerCase(),
            college: selectedCollege === "All Colleges" ? "" : selectedCollege,
            search
          }
        }),
        API.get("/colleges")
      ]);
      setEvents(eventsRes.data.data.events);
      setColleges(collegesRes.data.data.colleges);
    } catch (err) {
      toast.error("Failed to sync campus data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [category, search, selectedCollege]);

  const handleRegister = async (eventId) => {
    try {
      const res = await API.post(`/events/${eventId}/register`);
      toast.success(res.data.message || "Registered successfully!");
      // Optionally refresh data to update participant count
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register");
    }
  };

  return (
    <DashboardLayout>
      <header className="w-full flex flex-col gap-6 mb-10 max-w-6xl mx-auto">
        {/* Search Bar */}
        <div className="relative w-full max-w-3xl">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-700">
            <i className="fas fa-search text-xl"></i>
          </div>
          <input
            className="w-full pl-16 pr-4 py-4 rounded-2xl bg-[#bcc6e3] border-none focus:ring-0 text-gray-800 text-xl shadow-sm placeholder-gray-600"
            placeholder="Search events...."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Buttons Row */}
        <div className="flex flex-wrap gap-6 pl-2">
          <button className="browse-filter-pill">
            All Dates..
          </button>

          <div className="relative">
            <select
              className="browse-filter-pill border-none appearance-none focus:ring-0"
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
            >
              <option value="All Colleges">All Colleges..</option>
              {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="relative">
            <select
              className="browse-filter-pill border-none appearance-none focus:ring-0"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-16 h-16 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-black/60 text-2xl font-bold rounded-2xl">
          No events found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pb-10">
          {events.map((event) => (
            <article key={event._id} className="card-gradient p-8 flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-black">{event.title}</h2>
                  <button
                    onClick={() => handleRegister(event._id)}
                    className="bg-white/20 hover:bg-white/40 text-black px-4 py-1.5 rounded-xl text-sm font-bold border border-black/10 transition-all active:scale-95"
                  >
                    Register..
                  </button>
                </div>
                <p className="text-black text-sm mb-8 leading-snug">
                  {event.description}
                </p>
                <div className="text-sm text-black space-y-2 mb-6 font-medium leading-relaxed">
                  {event.registrationDeadline && (
                    <p>Apply before {new Date(event.registrationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, {new Date(event.registrationDeadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  )}
                  <p>Starts On {new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p>{event.college?.name}</p>
                  <p className="flex items-center gap-2 italic"><i className="fas fa-map-marker-alt"></i> {event.location}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-auto flex-wrap">
                <span className="category-badge capitalize">{event.category}</span>
                {event.requirements && event.requirements.map(req => (
                  <span key={req} className="category-badge capitalize">{req}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
