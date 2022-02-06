import {
  ActionPanel,
  List,
  OpenInBrowserAction,
  showToast,
  ToastStyle,
  randomId,
  PushAction,
} from "@raycast/api";
import { useState, useEffect, useRef } from "react";
import os from 'os'
import * as path from 'path'
import * as fs from 'fs'
import {AbortError} from "node-fetch";

const projectsFileName = ".raycast-gcp-shortcuts"
const servicesJsonFile = "assets/gcp-services.json"

export default function Command() {
  const { state, search } = useSearch();

  return (
    <List isLoading={state.isLoading} onSearchTextChange={search} searchBarPlaceholder="Search by name..." throttle>
      <List.Section title="Results" subtitle={state.results.length + ""}>
        {state.results.map((searchResult) => (
          <SearchListItem key={searchResult.id} searchResult={searchResult} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  return (
    <List.Item
      title={searchResult.name}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <PushAction title={searchResult.name} target={<SearchServices project={searchResult.name} />} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function SearchServices({ project }: { project: string }) {
  const { state, search } = useServiceSearch(project)

  return (
      <List onSearchTextChange={search} searchBarPlaceholder="Search by name..." throttle>
        <List.Section title="Results" subtitle={state.results.length + ""}>
          {state.results.map((searchResult) => (
              <SearchServiceItem key={searchResult.id} searchResult={searchResult} />
          ))}
        </List.Section>
      </List>
  )
}

function SearchServiceItem({ searchResult }: { searchResult: SearchResult }) {
  return (
      <List.Item
          title={searchResult.name}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <OpenInBrowserAction title="Open in Browser" url={searchResult.url} />
              </ActionPanel.Section>
            </ActionPanel>
          }
      />
  );
}

function useSearch() {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: true, selectedProject: null });
  const cancelRef = useRef<AbortController | null>(null);

  useEffect(() => {
    search("");
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  async function search(searchText: string) {
    cancelRef.current?.abort();
    cancelRef.current = new AbortController();
    try {
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));
      const results = await searchFromFile(searchText);
      setState((oldState) => ({
        ...oldState,
        results: results,
        isLoading: false,
      }));
    } catch (error) {
      if (error instanceof AbortError) {
        return;
      }
      console.error("search error", error);
      showToast(ToastStyle.Failure, "Could not perform search", String(error));
    }
  }

  return {
    state: state,
    search: search,
  };
}

async function searchFromFile(searchText: string): Promise<SearchResult[]> {
  const projectsFilePath = path.join(os.homedir(), projectsFileName)
  let content = await fs.promises.readFile(projectsFilePath, 'utf-8')
  let projects = content.split(/\r?\n/)
  return projects.filter(v => {
    return v.includes(searchText)
  }).map(v => {
    return {
      id: randomId(),
      name: v,
      url: `https://console.cloud.google.com/home/dashboard?project=${v}`,
    };
  })
}

async function searchServices(searchText: string, project: string): Promise<SearchResult[]> {
  const content = await fs.promises.readFile(path.join(__dirname, servicesJsonFile), 'utf-8')
  const services: ServiceObject[] = JSON.parse(content)
  const results = services.filter(s => {
    return s.name.toLowerCase().includes(searchText.toLowerCase())
  }).map(s => {
    return {
      id: randomId(),
      name: s.name,
      url: s.url.replace("{{PROJECT_ID}}", project)
    };
  })
  return Promise.resolve(results);
}

function useServiceSearch(project: string) {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: true, selectedProject: null });
  const cancelRef = useRef<AbortController | null>(null);

  useEffect(() => {
    search("");
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  async function search(searchText: string) {
    cancelRef.current?.abort();
    cancelRef.current = new AbortController();
    try {
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));
      const results = await searchServices(searchText, project);
      setState((oldState) => ({
        ...oldState,
        results: results,
        isLoading: false,
      }));
    } catch (error) {
      if (error instanceof AbortError) {
        return;
      }
      console.error("search error", error);
      showToast(ToastStyle.Failure, "Could not perform search", String(error));
    }
  }

  return {
    state: state,
    search: search,
  };
}

interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
  selectedProject: string | null;
}

interface SearchResult {
  id: string;
  name: string;
  url: string;
}

interface ServiceObject {
  name: string;
  url: string;
}
