import { shallowMount, Wrapper, WrapperArray } from "@vue/test-utils"
import Trending from "@/views/Trending.vue"
import { container, TYPE } from "@/repositories/Container";
import flushpromises from "flush-promises";
import TrendingControllerMockWrapper from '@/controllers/MockWrappers/TrendingControllerMockWrapper';
import TrendingController from '@/controllers/TrendingController';


const sinon = require('sinon');

describe("Trending.vue UI tests", () => {
    class TrendingWrapper {
      constructor(public wrapper: Wrapper<Trending>) {}

      get searchQueryView(): Wrapper<Trending> {
        return this.wrapper.find("#search-query") as Wrapper<Trending>
      }

      get searchResultsView(): Wrapper<Trending> {
        return this.wrapper.find("#search-results") as Wrapper<Trending>
      }

      get searchKeywordInputField(): HTMLInputElement {
        return this.wrapper.find("#keyword-input").element as HTMLInputElement
      }

      get addKeywordButton(): Wrapper<Trending> {
        return this.wrapper.find("#add-keyword-button") as Wrapper<Trending>
      }

      get allKeywords(): WrapperArray<Trending> {
        return this.wrapper.findAll(".keyword") as WrapperArray<Trending>
      }

      get sortByOptions(): Wrapper<Trending> {
        return this.wrapper.find("#sortby") as Wrapper<Trending>
      }

      get orderBySelector(): Wrapper<Trending> {
        return this.wrapper.find("#order-filter") as Wrapper<Trending>
      }

      get searchButton(): Wrapper<Trending> {
        return this.wrapper.find("#search-button") as Wrapper<Trending>
      }

      get refreshButton(): Wrapper<Trending> {
        return this.wrapper.find(".refresh-button") as Wrapper<Trending>
      }

      get backToSearchButton(): Wrapper<Trending> {
        return this.wrapper.find(".back-button") as Wrapper<Trending>
      }

      get loadingView(): Wrapper<Trending> {
        return this.wrapper.find("#trending-loading") as Wrapper<Trending>
      }
  
      get errorView(): Wrapper<Trending> {
        return this.wrapper.find("#trending-error") as Wrapper<Trending>
      }
  
      get reposList(): Wrapper<Trending> {
        return this.wrapper.find("#trending-content") as Wrapper<Trending>
      }
  
      get repoItems(): WrapperArray<Trending> {
        return this.wrapper.findAll("#repo-item") as WrapperArray<Trending>
      }

      get lastUpdatedTime(): Wrapper<Trending> {
        return this.wrapper.find("#last-updated-time") as Wrapper<Trending>
      }
    };

    const testRepo:Repo = {
      name: "foo", 
      url: "foo@example",
      description: "bar",
      username: "baz",
      unameUrl: "baz@example",
      avatarUrl: "avatar@example"
    }; 

    const setMocks = (trendingControllerMock: TrendingController) => {
        container
          .rebind<TrendingController>(TYPE.TrendingController)
          .toValue(trendingControllerMock);
    };

    const $Progress = {
      start: jest.fn().mockReturnValue(null),
      fail: jest.fn().mockReturnValue(null),
      finish: jest.fn().mockReturnValue(null),
    };

    it("expect to see a search query view when starting up view", async () => {
        const wrapper = new TrendingWrapper(shallowMount(Trending));
      
        expect(wrapper.searchQueryView.isVisible()).toBe(true);
        expect(wrapper.searchResultsView.exists()).toBe(false);
    });

    it("expect a keyword appear below search bar when input in keywords bar and plus button is clicked", () => {
      const wrapper = new TrendingWrapper(shallowMount(Trending));
      wrapper.wrapper.setData({kword: "java"});
      wrapper.addKeywordButton.trigger("click");

      expect(wrapper.allKeywords.wrappers[0].isVisible()).toBe(true);
      expect(wrapper.allKeywords.wrappers[0].find('p').element.innerHTML).toBe("java");
    });

    it("expect a keyword present below search bar to disappear  when its cross button is clicked", () => {
      const wrapper = new TrendingWrapper(shallowMount(Trending));
      wrapper.wrapper.setData({kword: "java"});
      wrapper.addKeywordButton.trigger("click");
      wrapper.allKeywords.wrappers[0].find(".remove-keyword-button").trigger("click");

      expect(wrapper.allKeywords.length).toEqual(0);
    });

    it("expect to see 'order by' dropdown when a 'sort by' dropdown option is selected other than default", () => {
        const wrapper = new TrendingWrapper(shallowMount(Trending));

        expect(wrapper.orderBySelector.exists()).toBe(false);
        wrapper.sortByOptions.findAll('option').at(1).element.setAttribute('selected', "true");
        wrapper.sortByOptions.trigger('change');
        expect(wrapper.orderBySelector.isVisible()).toBe(true);
    });

    it("expect to see a loading view when search button is clicked", async () => {
      let mockWrapper = new TrendingControllerMockWrapper(
        jest.fn().mockReturnValueOnce(new Promise((res, rej) => {}))
      );
      setMocks(mockWrapper.getMock());
  
      const wrapper = new TrendingWrapper(
        shallowMount(Trending, {
          mocks: {
            $Progress
          }
        }));
      wrapper.wrapper.setData({kword: "java"});
      wrapper.searchButton.trigger("click");
      await flushpromises();
  
      expect(wrapper.loadingView.isVisible()).toBe(true);
      expect(wrapper.errorView.exists()).toBe(false);
      expect(wrapper.reposList.exists()).toBe(false);
    });

    it("expect to see a error view when search button is clicked and error is returned", async () => {
      let mockWrapper = new TrendingControllerMockWrapper(
        jest.fn().mockReturnValueOnce(Promise.resolve({
            error: new Error("Internal Server Error"),
        }))
      );
      setMocks(mockWrapper.getMock());
  
      const wrapper = new TrendingWrapper(
        shallowMount(Trending, {
          mocks: {
            $Progress
          }
        }));
      wrapper.wrapper.setData({kword: "java"});
      wrapper.searchButton.trigger("click");
      await flushpromises();
  
      expect(wrapper.loadingView.exists()).toBe(false);
      expect(wrapper.errorView.exists()).toBe(true);
      expect(wrapper.reposList.exists()).toBe(false);
    });

    it("expect to see a trending list view when search button is clicked and list of repositories is returned", async () => {
        let mockWrapper = new TrendingControllerMockWrapper(
          jest.fn().mockReturnValueOnce(Promise.resolve({
              repos: [testRepo],
              no_of_pages: 1,
          }))
        );
        setMocks(mockWrapper.getMock());
    
        const wrapper = new TrendingWrapper(
          shallowMount(Trending, {
            mocks: {
              $Progress
            }
          }));
        wrapper.wrapper.setData({kword: "java"});
        wrapper.searchButton.trigger("click");
        await flushpromises();
    
        expect(wrapper.loadingView.exists()).toBe(false);
        expect(wrapper.errorView.exists()).toBe(false);
        expect(wrapper.reposList.exists()).toBe(true);
    });

    it("expect to come back to search query view when back to search button is clicked on trending error view", async () => {
      let mockWrapper = new TrendingControllerMockWrapper(
        jest.fn().mockReturnValueOnce(Promise.resolve({
          error: new Error("Internal Server Error"),
        }))
      );
      setMocks(mockWrapper.getMock());
  
      const wrapper = new TrendingWrapper(
        shallowMount(Trending, {
          mocks: {
            $Progress
          }
        }));
      wrapper.wrapper.setData({kword: "java"});
      wrapper.searchButton.trigger("click");
      await flushpromises();

      expect(wrapper.searchQueryView.exists()).toBe(false);
      expect(wrapper.errorView.isVisible()).toBe(true);
      wrapper.backToSearchButton.trigger("click");
      
      expect(wrapper.searchQueryView.isVisible()).toBe(true);
      expect(wrapper.errorView.exists()).toBe(false);
    });

    it("expect to come back to search query view when back to search button is clicked on trending list view", async () => {
      let mockWrapper = new TrendingControllerMockWrapper(
        jest.fn().mockReturnValueOnce(Promise.resolve({
            repos: [testRepo],
            no_of_pages: 1,
        }))
      );
      setMocks(mockWrapper.getMock());
  
      const wrapper = new TrendingWrapper(
        shallowMount(Trending, {
          mocks: {
            $Progress
          }
        }));
      wrapper.wrapper.setData({kword: "java"});
      wrapper.searchButton.trigger("click");
      await flushpromises();

      expect(wrapper.searchQueryView.exists()).toBe(false);
      expect(wrapper.reposList.isVisible()).toBe(true);
      wrapper.backToSearchButton.trigger("click");
      
      expect(wrapper.searchQueryView.isVisible()).toBe(true);
      expect(wrapper.reposList.exists()).toBe(false);
    });

    it("expect updateTimeDiff method of component to be called when lastUpdated data attribute changes", async () => {
      const spy = sinon.spy();
      const wrapper = new TrendingWrapper(
        shallowMount(Trending, {
          methods:{
            updateTimeDiff: spy,
          },
        }));
      wrapper.wrapper.setData({lastUpdated: new Date()});
      expect(spy.callCount).toEqual(2);
    });

    it("expect updateTimeDiff method of component to be called when trendingRepo list is fetched", async () => {
      let mockWrapper = new TrendingControllerMockWrapper(
        jest.fn().mockReturnValueOnce(Promise.resolve({
            repos: [testRepo],
            no_of_pages: 1,
        }))
      );
      setMocks(mockWrapper.getMock());

      const spy = sinon.spy();
      const wrapper = new TrendingWrapper(
        shallowMount(Trending, {
          methods:{
            updateTimeDiff: spy,
          },
          mocks: {
            $Progress
          }
        }));
      wrapper.searchButton.trigger("click");
      await flushpromises();
      expect(spy.callCount).toEqual(2);
    });

    it.skip("expect last updated since to automatically call updateTimeDiff show '1 min ago' after 1 min has passed on trending list view", async () => {
      let mockWrapper = new TrendingControllerMockWrapper(
        jest.fn().mockReturnValueOnce(Promise.resolve({
            repos: [testRepo],
            no_of_pages: 1,
        }))
      );
      setMocks(mockWrapper.getMock());

      jest.useFakeTimers();
      const wrapper = new TrendingWrapper(
        shallowMount(Trending, {
          mocks: {
            $Progress
          },
        }));
      
      wrapper.searchButton.trigger("click");
      await flushpromises();
      console.log("time diff prev", wrapper.wrapper.vm.$data.timeDiff);
      expect(wrapper.lastUpdatedTime.element.innerHTML).toEqual("Last Updated: now");
      jest.runTimersToTime(90000);
      console.log("time diff now", wrapper.wrapper.vm.$data.timeDiff);
      expect(wrapper.lastUpdatedTime.element.innerHTML).toEqual("Last Updated: 1 min ago");
      jest.useRealTimers();
    });

    it("expect to update trending list when refresh button is clicked", async () => {
      let mockWrapper = new TrendingControllerMockWrapper(
        jest.fn().mockReturnValueOnce(Promise.resolve({
            repos: [testRepo],
            no_of_pages: 1,
        }))
      );
      setMocks(mockWrapper.getMock());

      const wrapper = new TrendingWrapper(
        shallowMount(Trending, {
          mocks: {
            $Progress
          }
        }));
      const spy = sinon.spy(wrapper.wrapper.vm, "getTrendingRepos");
      
      wrapper.searchButton.trigger("click");
      await flushpromises();
      expect(wrapper.reposList.isVisible()).toBe(true);

      wrapper.refreshButton.trigger("click");
      expect(wrapper.loadingView.isVisible()).toBe(true);
      expect(spy.callCount).toEqual(2);
    });
})