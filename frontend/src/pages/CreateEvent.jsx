import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateEvent = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "workshop",
        location: "",
        startDate: "",
        endDate: "",
        maxParticipants: "",
        requirements: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Creating event...");

        // Convert requirements string to array
        const requirementsArray = form.requirements
            ? form.requirements.split(",").map(req => req.trim()).filter(req => req !== "")
            : [];

        try {
            await API.post("/events/create", {
                ...form,
                requirements: requirementsArray,
                maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null
            });
            toast.success("Event created successfully!", { id: loadingToast });
            navigate("/college-admin");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create event", { id: loadingToast });
        }
    };

    return (
        <DashboardLayout>
            <main className="w-full max-w-2xl space-y-8 mx-auto">
                <header className="text-left space-y-2 mb-8">
                    <h1 className="text-2xl text-gray-800 font-normal tracking-wide">
                        Create New Event....
                    </h1>
                    <p className="text-gray-500 text-base font-light">
                        Fill in the details to create a new campus event
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Field: Event Title */}
                    <div className="space-y-2">
                        <label className="block text-gray-800 text-base" htmlFor="event-title">
                            Event Title *..
                        </label>
                        <input
                            required
                            className="metallic-input w-full rounded-2xl py-3 px-5 text-gray-800 placeholder-gray-600 shadow-sm"
                            id="event-title"
                            placeholder="Enter event title........."
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    {/* Field: Description */}
                    <div className="space-y-2">
                        <label className="block text-gray-800 text-base" htmlFor="description">
                            Description *..
                        </label>
                        <textarea
                            required
                            className="metallic-input w-full rounded-2xl py-3 px-5 text-gray-800 placeholder-gray-600 shadow-sm resize-none"
                            id="description"
                            placeholder="Describe your event..."
                            rows="4"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        ></textarea>
                    </div>

                    {/* Field: Location */}
                    <div className="space-y-2">
                        <label className="block text-gray-800 text-base" htmlFor="location">
                            Location *..
                        </label>
                        <input
                            required
                            className="metallic-input w-full rounded-2xl py-3 px-5 text-gray-800 placeholder-gray-600 shadow-sm"
                            id="location"
                            placeholder="Where is this event happening?........."
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                        />
                    </div>

                    {/* Field: Requirements */}
                    <div className="space-y-2">
                        <label className="block text-gray-800 text-base" htmlFor="requirements">
                            Requirements (Optional)..
                        </label>
                        <input
                            className="metallic-input w-full rounded-2xl py-3 px-5 text-gray-800 placeholder-gray-600 shadow-sm"
                            id="requirements"
                            placeholder="Comma separated: Laptop, Id Card, etc........."
                            type="text"
                            value={form.requirements}
                            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                        />
                    </div>

                    {/* Row: Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Field: Start Date */}
                        <div className="space-y-2">
                            <label className="block text-gray-800 text-base" htmlFor="start-date">
                                Start date *..
                            </label>
                            <input
                                required
                                className="metallic-input w-full rounded-2xl py-3 px-5 text-gray-800 shadow-sm"
                                id="start-date"
                                type="datetime-local"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            />
                        </div>

                        {/* Field: End Date */}
                        <div className="space-y-2">
                            <label className="block text-gray-800 text-base" htmlFor="end-date">
                                End date *..
                            </label>
                            <input
                                required
                                className="metallic-input w-full rounded-2xl py-3 px-5 text-gray-800 shadow-sm"
                                id="end-date"
                                type="datetime-local"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Field: Category */}
                    <div className="space-y-2">
                        <label className="block text-gray-800 text-base" htmlFor="category">
                            Category *..
                        </label>
                        <div className="relative">
                            <select
                                className="metallic-input w-full rounded-2xl py-3 px-5 text-gray-800 shadow-sm appearance-none"
                                id="category"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                <option value="workshop">Workshop</option>
                                <option value="sports">Sports</option>
                                <option value="cultural">Cultural</option>
                                <option value="hackathon">Hackathon</option>
                                <option value="seminar">Seminar</option>
                                <option value="technical">Technical</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                                <i className="fas fa-chevron-down"></i>
                            </div>
                        </div>
                    </div>

                    {/* Field: Max Participants */}
                    <div className="space-y-2">
                        <label className="block text-gray-800 text-base" htmlFor="maxParticipants">
                            Max Participants..
                        </label>
                        <input
                            className="metallic-input w-full rounded-2xl py-3 px-5 text-gray-800 shadow-sm"
                            id="maxParticipants"
                            type="number"
                            placeholder="Unlimited if empty"
                            value={form.maxParticipants}
                            onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                        />
                    </div>

                    {/* Action Button */}
                    <div className="pt-6">
                        <button
                            className="w-full bg-[#92a1e3] hover:bg-[#8e9cd6] text-white font-medium py-3 px-6 rounded-2xl transition duration-200 ease-in-out shadow-md text-lg"
                            type="submit"
                        >
                            Create Event..
                        </button>
                    </div>
                </form>
            </main>
        </DashboardLayout>
    );
};

export default CreateEvent;
