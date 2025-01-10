import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Position {
  id: string;
  roles: string[];
}

const positions: Position[] = [
  { id: 'GK', roles: ['G (D)', 'SK (A)', 'SK (D)', 'SK (S)'] },
  { id: 'DRL', roles: ['CWB (A)', 'CWB (S)', 'FB (A)', 'FB (D)', 'FB (S)', 'IFB (D)', 'IWB (A)', 'IWB (S)', 'NFB (D)', 'WB (A)', 'WB (D)', 'WB (S)'] },
  { id: 'DC', roles: ['BPD (C)', 'BPD (D)', 'BPD (S)', 'CD (C)', 'CD (D)', 'CD (S)', 'L (D)', 'L (S)', 'NCB (C)', 'NCB (D)', 'NCB (S)', 'WCB (A)', 'WCB (D)', 'WCB (S)'] },
  { id: 'WBRL', roles: ['CWB (A)', 'CWB (S)', 'IWB (A)', 'IWB (D)', 'IWB (S)', 'WB (A)', 'WB (D)', 'WB (S)'] },
  { id: 'DM', roles: ['A (D)', 'BWM (D)', 'BWM (S)', 'DLP (D)', 'DLP (S)', 'DM (D)', 'DM (S)', 'HB (D)', 'RGA (S)', 'RPM (S)', 'VOL (A)', 'VOL (S)'] },
  { id: 'MRL', roles: ['DW (D)', 'DW (S)', 'IW (A)', 'IW (S)', 'W (A)', 'W (S)', 'WM (A)', 'WM (D)', 'WM (S)', 'WP (A)', 'WP (S)'] },
  { id: 'MC', roles: ['AP (A)', 'AP (S)', 'BBM (S)', 'BWM (D)', 'BWM (S)', 'CAR (S)', 'CM (A)', 'CM (D)', 'CM (S)', 'DLP (D)', 'DLP (S)', 'MEZ (A)', 'MEZ (S)', 'RPM (S)'] },
  { id: 'AMRL', roles: ['AP (A)', 'AP (S)', 'IF (A)', 'IF (S)', 'IW (A)', 'IW (S)', 'RMD (A)', 'T (A)', 'W (A)', 'W (S)', 'WTF (A)', 'WTF (S)'] },
  { id: 'AMC', roles: ['AM (A)', 'AM (S)', 'AP (A)', 'AP (S)', 'EG (S)', 'SS (A)', 'T (A)'] },
  { id: 'ST', roles: ['AF (A)', 'CF (A)', 'CF (S)', 'DLF (A)', 'DLF (S)', 'FN (S)', 'P (A)', 'PF (A)', 'PF (D)', 'PF (S)', 'T (A)', 'TF (A)', 'TF (S)'] }
];

export const FormationSelector = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-[#d5e8d4] p-6 rounded-lg">
        <div className="text-xl font-bold mb-4 flex justify-between items-center">
          <span>FORMATION SELECTOR</span>
          <span>POSITIONS SELECTED: 0</span>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {/* Attackers Row */}
          <div className="col-span-5 grid grid-cols-5 gap-4">
            <div></div>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="ST" />
              </SelectTrigger>
              <SelectContent>
                {positions[9].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="ST" />
              </SelectTrigger>
              <SelectContent>
                {positions[9].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="ST" />
              </SelectTrigger>
              <SelectContent>
                {positions[9].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div></div>
          </div>

          {/* Attacking Midfielders Row */}
          <div className="col-span-5 grid grid-cols-5 gap-4 mt-4">
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="AMRL" />
              </SelectTrigger>
              <SelectContent>
                {positions[7].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="AMC" />
              </SelectTrigger>
              <SelectContent>
                {positions[8].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="AMC" />
              </SelectTrigger>
              <SelectContent>
                {positions[8].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="AMC" />
              </SelectTrigger>
              <SelectContent>
                {positions[8].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="AMRL" />
              </SelectTrigger>
              <SelectContent>
                {positions[7].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Midfielders Row */}
          <div className="col-span-5 grid grid-cols-5 gap-4 mt-4">
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="MRL" />
              </SelectTrigger>
              <SelectContent>
                {positions[5].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="MC" />
              </SelectTrigger>
              <SelectContent>
                {positions[6].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="DM" />
              </SelectTrigger>
              <SelectContent>
                {positions[4].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="MC" />
              </SelectTrigger>
              <SelectContent>
                {positions[6].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="MRL" />
              </SelectTrigger>
              <SelectContent>
                {positions[5].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Defenders Row */}
          <div className="col-span-5 grid grid-cols-5 gap-4 mt-4">
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="WBRL" />
              </SelectTrigger>
              <SelectContent>
                {positions[3].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="DC" />
              </SelectTrigger>
              <SelectContent>
                {positions[2].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="DC" />
              </SelectTrigger>
              <SelectContent>
                {positions[2].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="DC" />
              </SelectTrigger>
              <SelectContent>
                {positions[2].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="WBRL" />
              </SelectTrigger>
              <SelectContent>
                {positions[3].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goalkeeper Row */}
          <div className="col-start-3 col-span-1 mt-4">
            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="GK" />
              </SelectTrigger>
              <SelectContent>
                {positions[0].roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationSelector;