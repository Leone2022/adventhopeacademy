'use client';

import { useState, useEffect } from 'react';
import {
  Home,
  Users,
  Bed,
  Search,
  Filter,
  Download,
  Eye,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Building,
  DoorOpen,
} from 'lucide-react';
import Link from 'next/link';

interface Hostel {
  id: string;
  name: string;
  gender: string;
  capacity: number;
  description?: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  stats: {
    totalRooms: number;
    totalCapacity: number;
    totalOccupied: number;
    available: number;
    occupancyRate: number;
  };
  blocks: Array<{
    id: string;
    name: string;
    rooms: Array<{
      id: string;
      roomNumber: string;
      capacity: number;
      beds: Array<{
        id: string;
        bedNumber: string;
        allocation?: {
          id: string;
          checkInDate: string;
          student: {
            id: string;
            firstName: string;
            lastName: string;
            middleName?: string;
            studentNumber: string;
            gender: string;
            photo?: string;
            currentClass?: {
              id: string;
              name: string;
            };
          };
        };
      }>;
    }>;
  }>;
}

export default function HostelPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hostels');
      const data = await response.json();
      
      if (response.ok) {
        setHostels(data.hostels);
        if (data.hostels.length > 0 && !selectedHostel) {
          setSelectedHostel(data.hostels[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoom = (roomId: string) => {
    setExpandedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  const selectedHostelData = hostels.find(h => h.id === selectedHostel);
  const allStudents = selectedHostelData
    ? selectedHostelData.blocks.flatMap(block =>
        block.rooms.flatMap(room =>
          room.beds
            .filter(bed => bed.allocation)
            .map(bed => ({
              ...bed.allocation!.student,
              roomNumber: room.roomNumber,
              blockName: block.name,
              hostelName: selectedHostelData.name,
              bedNumber: bed.bedNumber,
              checkInDate: bed.allocation!.checkInDate,
            }))
        )
      )
    : [];

  const filteredStudents = allStudents.filter(student => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(search) ||
      student.lastName.toLowerCase().includes(search) ||
      student.studentNumber.toLowerCase().includes(search) ||
      student.roomNumber.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading hostel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hostel Management</h1>
          <p className="text-slate-600 mt-1">
            View and manage student room allocations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium shadow-sm hover:shadow active:scale-95">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Hostel Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hostels.map((hostel) => (
          <div
            key={hostel.id}
            onClick={() => setSelectedHostel(hostel.id)}
            className={`bg-white rounded-xl border-2 p-5 shadow-sm cursor-pointer transition-all ${
              selectedHostel === hostel.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{hostel.name}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {hostel.stats.totalOccupied}/{hostel.stats.totalCapacity}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {hostel.stats.available} available
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedHostel === hostel.id ? 'bg-blue-100' : 'bg-slate-100'
              }`}>
                <Home className={`h-6 w-6 ${
                  selectedHostel === hostel.id ? 'text-blue-600' : 'text-slate-600'
                }`} />
              </div>
            </div>
            <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${hostel.stats.occupancyRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedHostelData && (
        <>
          {/* Search */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name, number, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Students in {selectedHostelData.name}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Student
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Student Number
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Block
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Room
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Bed
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Class
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Check-in Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Bed className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">No students found</p>
                        <p className="text-slate-500 text-sm mt-1">
                          {searchTerm ? 'Try adjusting your search' : 'No students allocated to this hostel yet'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                              {student.photo ? (
                                <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
                              ) : (
                                <>{student.firstName[0]}{student.lastName[0]}</>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">
                                {student.firstName} {student.middleName} {student.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-slate-700">
                            {student.studentNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700">{student.blockName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700">
                            <DoorOpen className="h-3 w-3" />
                            {student.roomNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-700">
                            <Bed className="h-3 w-3" />
                            {student.bedNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700">
                            {student.currentClass?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700">{formatDate(student.checkInDate)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Details View */}
          <div className="grid md:grid-cols-2 gap-6">
            {selectedHostelData.blocks.map((block) =>
              block.rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {block.name} - Room {room.roomNumber}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {room.beds.filter(bed => bed.allocation).length} / {room.capacity} beds occupied
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {room.beds.filter(bed => bed.allocation).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No students allocated</p>
                    ) : (
                      room.beds
                        .filter(bed => bed.allocation)
                        .map((bed) => (
                          <div
                            key={bed.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {bed.allocation!.student.firstName[0]}{bed.allocation!.student.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {bed.allocation!.student.firstName} {bed.allocation!.student.lastName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {bed.allocation!.student.studentNumber}
                                </p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
                              Bed {bed.bedNumber}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

