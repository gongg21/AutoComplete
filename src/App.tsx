import Animals from './data/animals';
import AutoComplete from './AutoComplete';

export type Option = string | { label: string, value: object };

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div>
        <h1 className="text-5xl font-bold text-center mb-5">AutoComplete!</h1>
        <div className="flex flex-row space-x-3">
          <AutoComplete
          description='With default display and search on focus'
          label='Sync Search'
          placeholder='Type to begin searching'
          loading={false}
          multiple={true}
          filterOptions={undefined}
          onChange={undefined}
          onInputChange={undefined}
          renderOption={undefined}
          options={Animals}
          value={[]}
        />
        <AutoComplete
          description='With single select and loading spinner'
          label='Debounced Search'
          placeholder='Type to begin searching'
          loading={true}
          multiple={false}
          filterOptions={undefined}
          onChange={undefined}
          onInputChange={undefined}
          renderOption={undefined}
          options={Animals}
          value={""}
        />
        </div>
      </div>
    </div>
  )
}

export default App
